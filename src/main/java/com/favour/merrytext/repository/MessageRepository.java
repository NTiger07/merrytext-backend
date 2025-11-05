package com.favour.merrytext.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.favour.merrytext.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByOwnerEmail(String ownerEmail);
    Optional<Message> findByMessageUrl(String messageUrl);
}
