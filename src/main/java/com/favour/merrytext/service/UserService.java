package com.favour.merrytext.service;

import com.favour.merrytext.model.User;
import com.favour.merrytext.model.Message;
import com.favour.merrytext.model.Transaction;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.repository.MessageRepository;
import com.favour.merrytext.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final TransactionRepository transactionRepository;

    public UserService(UserRepository userRepository,
            MessageRepository messageRepository,
            TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();

        // For each user, filter their messages and transactions
        for (User user : users) {
            List<Message> userMessages = messageRepository.findByOwnerEmailOrderBySentAtDesc(user.getEmail());
            List<Transaction> userTransactions = transactionRepository
                    .findByOwnerEmailOrderByCreatedAtDesc(user.getEmail());

            user.setMessages(userMessages);
            user.setTransactions(userTransactions);
        }

        return users;
    }

    public User getUserByUsername(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new IllegalStateException(
                "User does not exist"));

        List<Message> userMessages = messageRepository.findByOwnerEmailOrderBySentAtDesc(user.getEmail());
        List<Transaction> userTransactions = transactionRepository
                .findByOwnerEmailOrderByCreatedAtDesc(user.getEmail());

        user.setMessages(userMessages);
        user.setTransactions(userTransactions);

        return user;
    }
}
