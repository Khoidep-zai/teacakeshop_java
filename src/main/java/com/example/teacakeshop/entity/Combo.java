package com.example.teacakeshop.entity;

import com.example.teacakeshop.constant.WeatherType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "combos",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_combo_name",
                        columnNames = "name"
                )
        }
)
public class Combo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal comboPrice;

    @Column(length = 50)
    private String season;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WeatherType weatherType;

    @Column(nullable = false)
    private Integer soldQuantity;

    @Column(nullable = false)
    private Boolean hot;

    @Column(nullable = false)
    private Boolean bestSeller;

    @Column(nullable = false)
    private Boolean active;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(
            mappedBy = "combo",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ComboItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (originalPrice == null) {
            originalPrice = BigDecimal.ZERO;
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

        if (weatherType == null) {
            weatherType = WeatherType.NORMAL;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Combo() {
    }

    public void addItem(ComboItem item) {
        items.add(item);
        item.setCombo(this);
    }

    public void clearItems() {
        items.clear();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public BigDecimal getComboPrice() {
        return comboPrice;
    }

    public String getSeason() {
        return season;
    }

    public WeatherType getWeatherType() {
        return weatherType;
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<ComboItem> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public void setComboPrice(BigDecimal comboPrice) {
        this.comboPrice = comboPrice;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public void setWeatherType(WeatherType weatherType) {
        this.weatherType = weatherType;
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

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}