package team.lebron;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("hello", "Hello from SpringBoot!");
        response.put("team", "Team LeBron");
        return response;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = request.get("username");
            String password = request.get("password");
            String email = request.get("email");

            if (username == null || password == null || email == null) {
                response.put("success", false);
                response.put("message", "All fields are required");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userService.registerUser(username, password, email);
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("userId", user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest logReq) {
        Map<String, Object> response = new HashMap<>();
        UserService.AuthenticationResult authResult = userService.authenticateUser(logReq.getUsername(), logReq.getPassword());
        
        if (authResult.isSuccess()) {
            User user = authResult.getUser();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            String errorMessage;
            if ("USERNAME_NOT_FOUND".equals(authResult.getStatus())) {
                errorMessage = "The username you entered is not associated with any account in the system.";
            } else if ("INVALID_PASSWORD".equals(authResult.getStatus())) {
                errorMessage = "The password you entered is incorrect. Please try again.";
            } else {
                errorMessage = "Invalid username or password";
            }
            response.put("message", errorMessage);
            response.put("errorType", authResult.getStatus());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/menu")
    public List<Map<String, Object>> getMenuItems(@RequestParam(required = false) String category) {
        List<MenuItem> items;
        if (category != null && !category.isEmpty()) {
            items = menuItemRepository.findByCategory(category);
        } else {
            items = menuItemRepository.findAll();
        }

        return items.stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("id", item.getId());
            itemMap.put("name", item.getName());
            itemMap.put("description", item.getDescription());
            itemMap.put("price", item.getPrice());
            itemMap.put("category", item.getCategory());
            itemMap.put("imageUrl", item.getImageUrl());
            return itemMap;
        }).collect(Collectors.toList());
    }

    @PostMapping("/cart/add")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long menuItemId = Long.valueOf(request.get("menuItemId").toString());
            Integer quantity = request.get("quantity") != null ? 
                Integer.valueOf(request.get("quantity").toString()) : 1;
            String customizations = request.get("customizations") != null ? 
                request.get("customizations").toString() : null;

            cartService.addToCart(userId, menuItemId, quantity, customizations);
            response.put("success", true);
            response.put("message", "Item added to cart");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/cart")
    public ResponseEntity<Map<String, Object>> getCart(@RequestParam Long userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Cart cart = cartService.getOrCreateCart(userId);
            List<Map<String, Object>> items = cart.getItems().stream().map(item -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("menuItemId", item.getMenuItem().getId());
                itemMap.put("name", item.getMenuItem().getName());
                itemMap.put("description", item.getMenuItem().getDescription());
                itemMap.put("price", item.getMenuItem().getPrice());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("subtotal", item.getSubtotal());
                if (item.getCustomizations() != null && !item.getCustomizations().isEmpty()) {
                    itemMap.put("customizations", item.getCustomizations());
                }
                return itemMap;
            }).collect(Collectors.toList());

            BigDecimal total = cartService.calculateTotal(cart);
            response.put("success", true);
            response.put("items", items);
            response.put("total", total);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/cart/update")
    public ResponseEntity<Map<String, Object>> updateCartItem(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long cartItemId = Long.valueOf(request.get("cartItemId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());

            cartService.updateCartItemQuantity(userId, cartItemId, quantity);
            response.put("success", true);
            response.put("message", "Cart updated");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/cart/remove")
    public ResponseEntity<Map<String, Object>> removeFromCart(@RequestParam Long userId, @RequestParam Long cartItemId) {
        Map<String, Object> response = new HashMap<>();
        try {
            cartService.removeFromCart(userId, cartItemId);
            response.put("success", true);
            response.put("message", "Item removed from cart");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, Object>> checkout(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Order order = orderService.checkout(userId);
            response.put("success", true);
            response.put("message", "Order placed successfully");
            response.put("orderId", order.getId());
            response.put("total", order.getTotal());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
