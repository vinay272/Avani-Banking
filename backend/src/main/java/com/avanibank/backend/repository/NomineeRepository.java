package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Nominee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NomineeRepository extends JpaRepository<Nominee, Long> {

    List<Nominee> findByCustomerId(Long customerId);

}