package team.lebron;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Override
    public void run(String... args) {
        // Only initialize if database is empty
        if (menuItemRepository.count() == 0) {
            // Pizza items
            menuItemRepository.save(new MenuItem(
                    "Margherita Pizza",
                    "Classic pizza with tomato sauce, mozzarella, and fresh basil",
                    new BigDecimal("12.99"),
                    "pizza",
                    "https://via.placeholder.com/300x200?text=Margherita+Pizza"
            ));
            menuItemRepository.save(new MenuItem(
                    "Pepperoni Pizza",
                    "Traditional pepperoni pizza with mozzarella cheese",
                    new BigDecimal("14.99"),
                    "pizza",
                    "https://via.placeholder.com/300x200?text=Pepperoni+Pizza"
            ));
            menuItemRepository.save(new MenuItem(
                    "Supreme Pizza",
                    "Loaded with pepperoni, sausage, peppers, onions, and mushrooms",
                    new BigDecimal("16.99"),
                    "pizza",
                    "https://via.placeholder.com/300x200?text=Supreme+Pizza"
            ));
            menuItemRepository.save(new MenuItem(
                    "Hawaiian Pizza",
                    "Ham and pineapple on a classic pizza base",
                    new BigDecimal("15.99"),
                    "pizza",
                    "https://via.placeholder.com/300x200?text=Hawaiian+Pizza"
            ));

            // Drink items
            menuItemRepository.save(new MenuItem(
                    "Coke",
                    "Classic Coca-Cola",
                    new BigDecimal("2.99"),
                    "drinks",
                    "https://via.placeholder.com/300x200?text=Coke"
            ));
            menuItemRepository.save(new MenuItem(
                    "Sprite",
                    "Refreshing lemon-lime soda",
                    new BigDecimal("2.99"),
                    "drinks",
                    "https://via.placeholder.com/300x200?text=Sprite"
            ));
            menuItemRepository.save(new MenuItem(
                    "Fanta",
                    "Orange flavored soda",
                    new BigDecimal("2.99"),
                    "drinks",
                    "https://via.placeholder.com/300x200?text=Fanta"
            ));
            menuItemRepository.save(new MenuItem(
                    "Iced Tea",
                    "Freshly brewed iced tea",
                    new BigDecimal("2.49"),
                    "drinks",
                    "https://via.placeholder.com/300x200?text=Iced+Tea"
            ));

            // Dessert items
            menuItemRepository.save(new MenuItem(
                    "Chocolate Chunk Cookie",
                    "Warm, gooey chocolate chunk cookie",
                    new BigDecimal("4.99"),
                    "desserts",
                    "https://via.placeholder.com/300x200?text=Chocolate+Cookie"
            ));
            menuItemRepository.save(new MenuItem(
                    "Cinnamon Roll",
                    "Freshly baked cinnamon roll with cream cheese frosting",
                    new BigDecimal("5.99"),
                    "desserts",
                    "https://via.placeholder.com/300x200?text=Cinnamon+Roll"
            ));
            menuItemRepository.save(new MenuItem(
                    "Molten Lava Cake",
                    "Warm chocolate cake with a gooey center, served with vanilla ice cream",
                    new BigDecimal("6.99"),
                    "desserts",
                    "https://via.placeholder.com/300x200?text=Lava+Cake"
            ));
            menuItemRepository.save(new MenuItem(
                    "Tiramisu",
                    "Classic Italian dessert with coffee and mascarpone",
                    new BigDecimal("7.99"),
                    "desserts",
                    "https://via.placeholder.com/300x200?text=Tiramisu"
            ));
        }
    }
}

