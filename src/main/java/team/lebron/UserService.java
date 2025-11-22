package team.lebron;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public User registerUser(String username, String password, String email) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);

        user = userRepository.save(user);

        // Create cart for new user
        Cart cart = new Cart(user);
        cart = cartRepository.save(cart);
        user.setCart(cart);

        return userRepository.save(user);
    }

    public AuthenticationResult authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return new AuthenticationResult(null, "USERNAME_NOT_FOUND");
        }
        
        User user = userOpt.get();
        if (passwordEncoder.matches(password, user.getPassword())) {
            return new AuthenticationResult(user, "SUCCESS");
        } else {
            return new AuthenticationResult(null, "INVALID_PASSWORD");
        }
    }

    public static class AuthenticationResult {
        private final User user;
        private final String status;

        public AuthenticationResult(User user, String status) {
            this.user = user;
            this.status = status;
        }

        public User getUser() {
            return user;
        }

        public String getStatus() {
            return status;
        }

        public boolean isSuccess() {
            return "SUCCESS".equals(status);
        }
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}

