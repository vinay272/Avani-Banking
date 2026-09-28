package com.avanibank.backend.repository;

import com.avanibank.backend.entity.JointAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JointAccountRepository
        extends JpaRepository<JointAccount, Long> {

    List<JointAccount> findByPrimaryCustomerId(Long customerId);

    List<JointAccount> findByJointCustomerId(Long customerId);
}