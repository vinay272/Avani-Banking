package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Nominee;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.NomineeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NomineeService {

    private final NomineeRepository nomineeRepository;
    private final CustomerRepository customerRepository;

    public NomineeService(
            NomineeRepository nomineeRepository,
            CustomerRepository customerRepository) {

        this.nomineeRepository = nomineeRepository;
        this.customerRepository = customerRepository;
    }

    // =========================
    // ADD NOMINEE
    // =========================

    public Nominee addNominee(
            Long customerId,
            Nominee nominee) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        nominee.setCustomer(customer);

        return nomineeRepository.save(nominee);
    }

    // =========================
    // GET CUSTOMER NOMINEES
    // =========================

    public List<Nominee> getNomineesByCustomer(
            Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException("Customer not found");
        }

        return nomineeRepository.findByCustomerId(customerId);
    }

    // =========================
    // GET NOMINEE BY ID
    // =========================

    public Nominee getNomineeById(Long id) {

        return nomineeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Nominee not found"));
    }

    // =========================
    // UPDATE NOMINEE
    // =========================

    public Nominee updateNominee(
            Long id,
            Nominee updatedNominee) {

        Nominee existingNominee =
                getNomineeById(id);

        existingNominee.setFullName(
                updatedNominee.getFullName()
        );

        existingNominee.setRelationship(
                updatedNominee.getRelationship()
        );

        existingNominee.setPhone(
                updatedNominee.getPhone()
        );

        existingNominee.setDateOfBirth(
                updatedNominee.getDateOfBirth()
        );

        existingNominee.setAddress(
                updatedNominee.getAddress()
        );

        existingNominee.setSharePercentage(
                updatedNominee.getSharePercentage()
        );

        return nomineeRepository.save(existingNominee);
    }

    // =========================
    // DELETE NOMINEE
    // =========================

    public void deleteNominee(Long id) {

        Nominee nominee =
                getNomineeById(id);

        nomineeRepository.delete(nominee);
    }
}