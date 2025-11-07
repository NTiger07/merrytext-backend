package com.favour.merrytext.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.favour.merrytext.payment.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);

    Optional<Transaction> findByStripePaymentIntentId(String stripePaymentIntentId);
}
