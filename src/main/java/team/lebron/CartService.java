package team.lebron;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            return cartOpt.get();
        }
        // If cart doesn't exist, it should have been created during registration
        // This is a fallback
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            Cart cart = new Cart(userOpt.get());
            return cartRepository.save(cart);
        }
        throw new RuntimeException("User not found");
    }

    @Transactional
    public void addToCart(Long userId, Long menuItemId, Integer quantity) {
        addToCart(userId, menuItemId, quantity, null);
    }

    @Transactional
    public void addToCart(Long userId, Long menuItemId, Integer quantity, String customizations) {
        Cart cart = getOrCreateCart(userId);
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // For items with customizations, always create a new cart item
        // For items without customizations, check if item already in cart
        if (customizations == null || customizations.isEmpty()) {
            Optional<CartItem> existingItem = cart.getItems().stream()
                    .filter(item -> item.getMenuItem().getId().equals(menuItemId) && 
                                   (item.getCustomizations() == null || item.getCustomizations().isEmpty()))
                    .findFirst();

            if (existingItem.isPresent()) {
                CartItem item = existingItem.get();
                item.setQuantity(item.getQuantity() + quantity);
                cartItemRepository.save(item);
                return;
            }
        }

        CartItem cartItem = new CartItem(cart, menuItem, quantity);
        if (customizations != null && !customizations.isEmpty()) {
            cartItem.setCustomizations(customizations);
        }
        cart.getItems().add(cartItem);
        cartItemRepository.save(cartItem);
    }

    @Transactional
    public void updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
    }

    public BigDecimal calculateTotal(Cart cart) {
        return cart.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

