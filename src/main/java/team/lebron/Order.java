package team.lebron;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    private BigDecimal total;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Column(nullable = false)
    private String status; // "pending", "confirmed", "completed"

    @Column
    private String deliveryAddress;

    @Column
    private String paymentCardType; // "Visa", "Mastercard", "Amex", etc.

    @Column
    private String paymentCardLast4; // Last 4 digits for display

    public Order() {
        this.orderDate = LocalDateTime.now();
        this.status = "pending";
    }

    public Order(User user, BigDecimal total) {
        this.user = user;
        this.total = total;
        this.orderDate = LocalDateTime.now();
        this.status = "pending";
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getPaymentCardType() {
        return paymentCardType;
    }

    public void setPaymentCardType(String paymentCardType) {
        this.paymentCardType = paymentCardType;
    }

    public String getPaymentCardLast4() {
        return paymentCardLast4;
    }

    public void setPaymentCardLast4(String paymentCardLast4) {
        this.paymentCardLast4 = paymentCardLast4;
    }
}

