package team.lebron;

import jakarta.persistence.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(columnDefinition = "TEXT")
    private String customizations; // JSON string for pizza customizations

    public CartItem() {}

    public CartItem(Cart cart, MenuItem menuItem, Integer quantity) {
        this.cart = cart;
        this.menuItem = menuItem;
        this.quantity = quantity;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }

    public void setMenuItem(MenuItem menuItem) {
        this.menuItem = menuItem;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getCustomizations() {
        return customizations;
    }

    public void setCustomizations(String customizations) {
        this.customizations = customizations;
    }

    public BigDecimal getSubtotal() {
        BigDecimal basePrice = menuItem.getPrice();
        
        // Check for price adjustment in customizations (for pizza sizes)
        if (customizations != null && !customizations.isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                @SuppressWarnings("unchecked")
                Map<String, Object> customMap = mapper.readValue(customizations, Map.class);
                
                // Check for sizeAdjustment in customizations
                if (customMap.containsKey("sizeAdjustment")) {
                    Object adjustmentObj = customMap.get("sizeAdjustment");
                    if (adjustmentObj instanceof Number) {
                        BigDecimal adjustment = BigDecimal.valueOf(((Number) adjustmentObj).doubleValue());
                        basePrice = basePrice.add(adjustment);
                    }
                }
            } catch (Exception e) {
                // If parsing fails, use base price
            }
        }
        
        return basePrice.multiply(BigDecimal.valueOf(quantity));
    }
}

