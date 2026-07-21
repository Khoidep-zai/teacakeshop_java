package com.example.teacakeshop.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "combo_items",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_combo_item_combo_product",
                        columnNames = {
                                "combo_id",
                                "product_id"
                        }
                )
        }
)
public class ComboItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Combo chứa dòng sản phẩm này.
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "combo_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_combo_item_combo"
            )
    )
    private Combo combo;

    /*
     * Sản phẩm nằm trong combo.
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "product_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_combo_item_product"
            )
    )
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    public ComboItem() {
    }

    public Long getId() {
        return id;
    }

    public Combo getCombo() {
        return combo;
    }

    public Product getProduct() {
        return product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCombo(Combo combo) {
        this.combo = combo;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}