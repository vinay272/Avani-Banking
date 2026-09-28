package com.avanibank.backend.service;

import org.springframework.stereotype.Service;

@Service
public class BankingChatbotService {

    public String getResponse(String message) {

        if (message == null || message.isBlank()) {
            return "Please enter your question so I can help you.";
        }

        String text = message.toLowerCase().trim();

        if (containsAny(text, "balance", "account balance")) {
            return "You can check your latest account balance from the Accounts section of Avani Bank.";
        }

        if (containsAny(text, "upi", "upi payment")) {
            return "For UPI payments, open Digital Payments and select UPI. You can send money using a UPI ID, mobile number or QR code.";
        }

        if (containsAny(text, "neft")) {
            return "NEFT transfers can be initiated from the Fund Transfer section. Please verify the beneficiary details before confirming.";
        }

        if (containsAny(text, "rtgs")) {
            return "RTGS is suitable for eligible high-value bank transfers. Please verify the beneficiary and transfer details before confirmation.";
        }

        if (containsAny(text, "imps")) {
            return "IMPS provides instant bank-to-bank transfers and is available through the Digital Payments section.";
        }

        if (containsAny(text, "loan", "emi")) {
            return "You can view your loans, EMI details and repayment information from the Loan Management section.";
        }

        if (containsAny(text, "credit card", "debit card", "card")) {
            return "You can manage your Avani Bank cards, transactions and card-related services from the Cards section.";
        }

        if (containsAny(text, "complaint", "complain")) {
            return "You can register a complaint from Customer Support. After registration, you will receive a unique ticket number to track it.";
        }

        if (containsAny(text, "service request", "service request")) {
            return "You can create and track service requests from the Customer Support section.";
        }

        if (containsAny(text, "appointment", "branch appointment")) {
            return "You can book a branch appointment by selecting the branch, date, time and purpose from Customer Support.";
        }

        if (containsAny(text, "fraud", "suspicious", "scam")) {
            return "If you notice a suspicious transaction or possible fraud, report it immediately through the Security & Risk section and contact bank support.";
        }

        if (containsAny(text, "password", "login")) {
            return "For login or password-related issues, please use the available account recovery options or contact Avani Bank Customer Support.";
        }

        if (containsAny(text, "hello", "hi", "hey")) {
            return "Hello! I'm Avani Bank's virtual banking assistant. How can I help you today?";
        }

        if (containsAny(text, "thank", "thanks")) {
            return "You're welcome! I'm always here to help with your banking questions.";
        }

        return "I can help with accounts, UPI, NEFT, RTGS, IMPS, loans, cards, complaints, service requests, branch appointments and banking security. Please tell me what you need help with.";
    }

    private boolean containsAny(String text, String... keywords) {

        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }
}