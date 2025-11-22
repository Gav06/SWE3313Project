package team.lebron;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Transactional
    public Order checkout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartService.getOrCreateCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Create order
        BigDecimal total = cartService.calculateTotal(cart);
        Order order = new Order(user, total);
        order = orderRepository.save(order);

        // Create order items
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem(
                    order,
                    cartItem.getMenuItem(),
                    cartItem.getQuantity(),
                    cartItem.getMenuItem().getPrice()
            );
            orderItemRepository.save(orderItem);
            order.getItems().add(orderItem);
        }

        // Clear cart
        cartService.clearCart(userId);

        return order;
    }
}

