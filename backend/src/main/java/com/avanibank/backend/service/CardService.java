package com.avanibank.backend.service;

import com.avanibank.backend.dto.CardIssuanceRequest;
import com.avanibank.backend.dto.CardLimitRequest;
import com.avanibank.backend.dto.CardStatementResponse;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Card;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CardRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.TransactionRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionRepository transactionRepository;

    public CardService(
            CardRepository cardRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            TransactionRepository transactionRepository) {

        this.cardRepository = cardRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionRepository = transactionRepository;
    } 

    // =====================================================
    // CARD ISSUANCE
    // =====================================================

    @Transactional
    public Card issueCard(
            String customerEmail,
            CardIssuanceRequest request) {

        if (request == null) {
            throw new RuntimeException(
                    "Card issuance request cannot be empty"
            );
        }

        if (request.getAccountId() == null) {
            throw new RuntimeException(
                    "Account is required"
            );
        }

        String cardType =
                request.getCardType() == null
                        ? ""
                        : request.getCardType()
                                .trim()
                                .toUpperCase();

        String cardNetwork =
                request.getCardNetwork() == null
                        ? ""
                        : request.getCardNetwork()
                                .trim()
                                .toUpperCase();

        if (!cardType.equals("DEBIT")
                && !cardType.equals("CREDIT")) {

            throw new RuntimeException(
                    "Card type must be DEBIT or CREDIT"
            );
        }

        if (!cardNetwork.equals("VISA")
                && !cardNetwork.equals("MASTERCARD")) {

            throw new RuntimeException(
                    "Card network must be VISA or MASTERCARD"
            );
        }

        Customer customer =
                customerRepository.findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        Account account =
                accountRepository.findByIdAndCustomerId(
                                request.getAccountId(),
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Account is not active"
            );
        }

        boolean alreadyIssued =
                cardRepository
                        .existsByCustomerIdAndAccountIdAndCardTypeAndStatus(
                                customer.getId(),
                                account.getId(),
                                cardType,
                                "ISSUED"
                        )
                ||
                cardRepository
                        .existsByCustomerIdAndAccountIdAndCardTypeAndStatus(
                                customer.getId(),
                                account.getId(),
                                cardType,
                                "ACTIVE"
                        );

        if (alreadyIssued) {
            throw new RuntimeException(
                    "An active or issued "
                            + cardType
                            + " card already exists for this account"
            );
        }

        String cardNumber;

        do {
            cardNumber = generateCardNumber();
        } while (
                cardRepository.existsByCardNumberHash(
                        hashValue(cardNumber)
                )
        );

        Card card = new Card();

        card.setCustomer(customer);
        card.setAccount(account);
        card.setCardType(cardType);
        card.setCardNetwork(cardNetwork);

        card.setCardNumberHash(
                hashValue(cardNumber)
        );

        card.setMaskedCardNumber(
                maskCardNumber(cardNumber)
        );

        card.setExpiryDate(
                LocalDate.now().plusYears(5)
        );

        card.setStatus("ISSUED");

        card.setDailyTransactionLimit(
                cardType.equals("CREDIT")
                        ? 100000.0
                        : 50000.0
        );

        card.setMonthlyTransactionLimit(
                cardType.equals("CREDIT")
                        ? 500000.0
                        : 200000.0
        );

        card.setInternationalUsageEnabled(false);
        card.setPinSet(false);
        card.setRewardPoints(0L);

        if (cardType.equals("CREDIT")) {
            card.setCreditLimit(100000.0);
        } else {
            card.setCreditLimit(null);
        }

        Card savedCard =
                cardRepository.save(card);

        /*
         * Card number is intentionally not stored in plain text.
         * For the initial issuance response we attach it temporarily
         * to a transient field in the controller response DTO later.
         */

        return savedCard;
    }

    // =====================================================
    // GET MY CARDS
    // =====================================================

    @Transactional(readOnly = true)
    public List<Card> getMyCards(String customerEmail) {

        Customer customer =
                customerRepository.findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        return cardRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

// =====================================================
// CARD ACTIVATION
// =====================================================

@Transactional
public Card activateCard(
        String customerEmail,
        Long cardId) {

    Customer customer =
            customerRepository.findByEmail(customerEmail)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Customer not found"
                            )
                    );

    Card card =
            cardRepository.findByIdAndCustomerId(
                            cardId,
                            customer.getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Card not found"
                            )
                    );

    if ("ACTIVE".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
                "Card is already active"
        );
    }

    if (!"ISSUED".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
                "Only ISSUED cards can be activated"
        );
    }

    if (card.getExpiryDate() != null
            && card.getExpiryDate().isBefore(LocalDate.now())) {

        throw new RuntimeException(
                "Card has expired"
        );
    }

    card.setStatus("ACTIVE");
    card.setActivatedAt(
            java.time.LocalDateTime.now()
    );

    return cardRepository.save(card);
    }

// =====================================================
// PIN GENERATION / SET PIN
// =====================================================

@Transactional
public Card generatePin(
        String customerEmail,
        Long cardId,
        String pin) {

    Customer customer =
            customerRepository.findByEmail(customerEmail)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Customer not found"
                            )
                    );

    Card card =
            cardRepository.findByIdAndCustomerId(
                            cardId,
                            customer.getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Card not found"
                            )
                    );

    if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
                "Only ACTIVE cards can have a PIN"
        );
    }

    if (Boolean.TRUE.equals(card.getPinSet())) {
        throw new RuntimeException(
                "PIN is already set for this card"
        );
    }

    if (pin == null || !pin.matches("\\d{4}")) {
        throw new RuntimeException(
                "PIN must contain exactly 4 digits"
        );
    }

    if (pin.matches("(\\d)\\1\\1\\1")) {
        throw new RuntimeException(
                "PIN cannot contain four identical digits"
        );
    }

    if (pin.equals("1234")
            || pin.equals("4321")
            || pin.equals("0000")) {

        throw new RuntimeException(
                "Please choose a stronger PIN"
        );
    }

    card.setPinHash(
            passwordEncoder.encode(pin)
    );

    card.setPinSet(true);

    return cardRepository.save(card);
    }

// =====================================================
// CHANGE CARD PIN
// =====================================================

@Transactional
public Card changePin(
        String customerEmail,
        Long cardId,
        String currentPin,
        String newPin) {

    Customer customer =
            customerRepository.findByEmail(customerEmail)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Customer not found"
                            )
                    );

    Card card =
            cardRepository.findByIdAndCustomerId(
                            cardId,
                            customer.getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Card not found"
                            )
                    );

    if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
                "Only ACTIVE cards can change PIN"
        );
    }

    if (!Boolean.TRUE.equals(card.getPinSet())
            || card.getPinHash() == null) {

        throw new RuntimeException(
                "PIN has not been set for this card"
        );
    }

    if (currentPin == null
            || !currentPin.matches("\\d{4}")) {

        throw new RuntimeException(
                "Current PIN must contain exactly 4 digits"
        );
    }

    if (newPin == null
            || !newPin.matches("\\d{4}")) {

        throw new RuntimeException(
                "New PIN must contain exactly 4 digits"
        );
    }

    if (!passwordEncoder.matches(
            currentPin,
            card.getPinHash())) {

        throw new RuntimeException(
                "Current PIN is incorrect"
        );
    }

    if (currentPin.equals(newPin)) {
        throw new RuntimeException(
                "New PIN must be different from current PIN"
        );
    }

    validateNewPin(newPin);

    card.setPinHash(
            passwordEncoder.encode(newPin)
    );

    card.setPinSet(true);

    return cardRepository.save(card);
}


// =====================================================
// RESET / FORGOT CARD PIN
// =====================================================

@Transactional
public Card resetPin(
        String customerEmail,
        Long cardId,
        String newPin) {

    Customer customer =
            customerRepository.findByEmail(customerEmail)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Customer not found"
                            )
                    );

    Card card =
            cardRepository.findByIdAndCustomerId(
                            cardId,
                            customer.getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Card not found"
                            )
                    );

    if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
                "Only ACTIVE cards can reset PIN"
        );
    }

    if (newPin == null
            || !newPin.matches("\\d{4}")) {

        throw new RuntimeException(
                "New PIN must contain exactly 4 digits"
        );
    }

    validateNewPin(newPin);

    card.setPinHash(
            passwordEncoder.encode(newPin)
    );

    card.setPinSet(true);

    return cardRepository.save(card);
}


// =====================================================
// PIN VALIDATION
// =====================================================

private void validateNewPin(String pin) {

    if (pin.matches("(\\d)\\1\\1\\1")) {
        throw new RuntimeException(
                "PIN cannot contain four identical digits"
        );
    }

    if (pin.equals("1234")
            || pin.equals("4321")
            || pin.equals("0000")) {

        throw new RuntimeException(
                "Please choose a stronger PIN"
        );
    }
}

// =====================================================
// CARD BLOCKING
// =====================================================

@Transactional
public Card blockCard(
        String customerEmail,
        Long cardId) {

    Customer customer =
            customerRepository.findByEmail(customerEmail)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Customer not found"
                            )
                    );

    Card card =
            cardRepository.findByIdAndCustomerId(
                            cardId,
                            customer.getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Card not found"
                            )
                    );

    if ("BLOCKED".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
                "Card is already blocked"
        );
    }

    if ("REPLACED".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
                "Replaced card cannot be blocked"
        );
    }

    if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
                "Only ACTIVE cards can be blocked"
        );
    }

    card.setStatus("BLOCKED");
    card.setBlockedAt(
            java.time.LocalDateTime.now()
    );

    return cardRepository.save(card);
    }

    // =====================================================
    // CARD REPLACE
    // =====================================================

    @Transactional
    public Card replaceCard(String customerEmail, Long cardId) {

    Customer customer = customerRepository.findByEmail(customerEmail)
        .orElseThrow(() -> new RuntimeException("Customer not found"));

    Card oldCard = cardRepository.findByIdAndCustomerId(cardId, customer.getId())
        .orElseThrow(() -> new RuntimeException("Card not found"));

    // Replacement sirf BLOCKED card ka hoga
    if (!"BLOCKED".equalsIgnoreCase(oldCard.getStatus())) {
        throw new RuntimeException("Only BLOCKED cards can be replaced");
    }

    // New card number generate karo
    String newCardNumber = generateCardNumber();

    // Extremely unlikely duplicate case ko handle karo
    while (cardRepository.existsByCardNumberHash(hashValue(newCardNumber))) {
        newCardNumber = generateCardNumber();
    }

    // Old card ko REPLACED mark karo
    oldCard.setStatus("REPLACED");
    cardRepository.save(oldCard);

    // New card create karo
    Card newCard = new Card();

    newCard.setCustomer(customer);
    newCard.setAccount(oldCard.getAccount());

    newCard.setCardType(oldCard.getCardType());
    newCard.setCardNetwork(oldCard.getCardNetwork());

    newCard.setCardNumberHash(hashValue(newCardNumber));
    newCard.setMaskedCardNumber(maskCardNumber(newCardNumber));

    // Replacement ke baad 5 years validity
    newCard.setExpiryDate(LocalDate.now().plusYears(5));

    newCard.setStatus("ISSUED");

    // PIN dobara set karna hoga
    newCard.setPinHash(null);
    newCard.setPinSet(false);

    // Security ke liye international usage OFF
    newCard.setInternationalUsageEnabled(false);

    // Existing card ki transaction limits carry forward
    newCard.setDailyTransactionLimit(oldCard.getDailyTransactionLimit());
    newCard.setMonthlyTransactionLimit(oldCard.getMonthlyTransactionLimit());

    // Existing reward points carry forward
    newCard.setRewardPoints(
        oldCard.getRewardPoints() == null ? 0L : oldCard.getRewardPoints()
    );

    // Credit limit bhi carry forward
    newCard.setCreditLimit(oldCard.getCreditLimit());

    return cardRepository.save(newCard);
}

    // =====================================================
    // TRANSACTION LIMIT
    // =====================================================

    @Transactional
    public Card updateTransactionLimits(
        String customerEmail,
        Long cardId,
        CardLimitRequest request) {

    Customer customer = customerRepository.findByEmail(customerEmail)
        .orElseThrow(() -> new RuntimeException("Customer not found"));

    Card card = cardRepository.findByIdAndCustomerId(cardId, customer.getId())
        .orElseThrow(() -> new RuntimeException("Card not found"));

    if (request == null) {
        throw new RuntimeException("Limit request cannot be empty");
    }

    if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException("Only ACTIVE cards can have transaction limits updated");
    }

    Double dailyLimit = request.getDailyTransactionLimit();
    Double monthlyLimit = request.getMonthlyTransactionLimit();

    if (dailyLimit == null || dailyLimit <= 0) {
        throw new RuntimeException("Daily transaction limit must be greater than 0");
    }

    if (monthlyLimit == null || monthlyLimit <= 0) {
        throw new RuntimeException("Monthly transaction limit must be greater than 0");
    }

    if (dailyLimit > monthlyLimit) {
        throw new RuntimeException(
            "Daily transaction limit cannot be greater than monthly transaction limit"
        );
    }

    card.setDailyTransactionLimit(dailyLimit);
    card.setMonthlyTransactionLimit(monthlyLimit);

    return cardRepository.save(card);
    }

    // =====================================================
    // INTERNATIONAL USAGE 
    // =====================================================

    @Transactional
    public Card updateInternationalUsage(
        String customerEmail,
        Long cardId,
        Boolean enabled) {

    Customer customer = customerRepository.findByEmail(customerEmail)
        .orElseThrow(() -> new RuntimeException("Customer not found"));

    Card card = cardRepository.findByIdAndCustomerId(cardId, customer.getId())
        .orElseThrow(() -> new RuntimeException("Card not found"));

    if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
            "Only ACTIVE cards can change international usage"
        );
    }

    if (enabled == null) {
        throw new RuntimeException(
            "International usage enabled value is required"
        );
    }

    card.setInternationalUsageEnabled(enabled);

    return cardRepository.save(card);
    }

    // =====================================================
    // REWARD POINTS
    // =====================================================

    @Transactional
public Card addRewardPoints(
        String customerEmail,
        Long cardId,
        Long points) {

    Customer customer = customerRepository.findByEmail(customerEmail)
        .orElseThrow(() -> new RuntimeException("Customer not found"));

    Card card = cardRepository.findByIdAndCustomerId(cardId, customer.getId())
        .orElseThrow(() -> new RuntimeException("Card not found"));

    if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) {
        throw new RuntimeException(
            "Only ACTIVE cards can earn reward points"
        );
    }

    if (points == null || points <= 0) {
        throw new RuntimeException(
            "Reward points must be greater than 0"
        );
    }

    Long currentPoints = card.getRewardPoints() == null
        ? 0L
        : card.getRewardPoints();

    long updatedPoints;

    try {
        updatedPoints = Math.addExact(currentPoints, points);
    } catch (ArithmeticException e) {
        throw new RuntimeException("Reward points limit exceeded");
    }

    card.setRewardPoints(updatedPoints);

    return cardRepository.save(card);
}

    // =====================================================
    // CARD STATEMENT
    // =====================================================

    @Transactional(readOnly = true)
    public List<CardStatementResponse> getCardStatement(
        String customerEmail,
        Long cardId) {

    Customer customer = customerRepository.findByEmail(customerEmail)
        .orElseThrow(() -> new RuntimeException("Customer not found"));

    Card card = cardRepository.findByIdAndCustomerId(
            cardId,
            customer.getId()
        )
        .orElseThrow(() -> new RuntimeException("Card not found"));

    String accountNumber = card.getAccount().getAccountNumber();

    List<Transaction> transactions =
        transactionRepository
            .findBySenderAccountNumberOrReceiverAccountNumberOrderByTransactionDateDesc(
                accountNumber,
                accountNumber
            );

    return transactions.stream()
        .map(transaction -> new CardStatementResponse(
            transaction.getId(),
            card.getMaskedCardNumber(),
            transaction.getTransactionType(),
            transaction.getSenderAccountNumber(),
            transaction.getReceiverAccountNumber(),
            transaction.getAmount(),
            transaction.getStatus(),
            transaction.getTransactionDate()
        ))
        .collect(Collectors.toList());
    }

    // =====================================================
    // GET SINGLE CARD
    // =====================================================

    @Transactional(readOnly = true)
    public Card getMyCard(
            String customerEmail,
            Long cardId) {

        Customer customer =
                customerRepository.findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        return cardRepository
                .findByIdAndCustomerId(
                        cardId,
                        customer.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Card not found"
                        )
                );
    }

    // =====================================================
    // GENERATE CARD NUMBER
    // =====================================================

    private String generateCardNumber() {

        String randomPart =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "");

        StringBuilder number =
                new StringBuilder("4");

        for (int i = 0; i < 15; i++) {
            number.append(
                    randomPart.charAt(
                            i % randomPart.length()
                    )
                );
        }

        return number.toString();
    }

    // =====================================================
    // MASK CARD NUMBER
    // =====================================================

    private String maskCardNumber(String cardNumber) {

        return "**** **** **** "
                + cardNumber.substring(
                        cardNumber.length() - 4
                );
    }

    // =====================================================
    // HASH VALUE
    // =====================================================

    private String hashValue(String value) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            StringBuilder result =
                    new StringBuilder();

            for (byte b : hash) {
                result.append(
                        String.format("%02x", b)
                );
            }

            return result.toString();

        } catch (Exception e) {
    
            throw new RuntimeException(
                    "Unable to secure card number"
            );
        }
    }
}