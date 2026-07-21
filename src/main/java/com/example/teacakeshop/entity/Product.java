package com.example.teacakeshop.entity;

import com.example.teacakeshop.constant.ProductType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "category_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_product_category")
    )
    private Category category;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductType productType;

    @Column(length = 100)
    private String taste;

    @Column(length = 50)
    private String temperatureType;

    @Column(length = 50)
    private String season;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false)
    private Integer soldQuantity;

    @Column(nullable = false)
    private Boolean hot;

    @Column(nullable = false)
    private Boolean bestSeller;

    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (stockQuantity == null) {
            stockQuantity = 0;
        }

        if (soldQuantity == null) {
            soldQuantity = 0;
        }

        if (hot == null) {
            hot = false;
        }

        if (bestSeller == null) {
            bestSeller = false;
        }

        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Product() {
    }

    public Long getId() {
        return id;
    }

    public Category getCategory() {
        return category;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public ProductType getProductType() {
        return productType;
    }

    public String getTaste() {
        return taste;
    }

    public String getTemperatureType() {
        return temperatureType;
    }

    public String getSeason() {
        return season;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public Integer getSoldQuantity() {
        return soldQuantity;
    }

    public Boolean getHot() {
        return hot;
    }

    public Boolean getBestSeller() {
        return bestSeller;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setProductType(ProductType productType) {
        this.productType = productType;
    }

    public void setTaste(String taste) {
        this.taste = taste;
    }

    public void setTemperatureType(String temperatureType) {
        this.temperatureType = temperatureType;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public void setSoldQuantity(Integer soldQuantity) {
        this.soldQuantity = soldQuantity;
    }

    public void setHot(Boolean hot) {
        this.hot = hot;
    }

    public void setBestSeller(Boolean bestSeller) {
        this.bestSeller = bestSeller;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}