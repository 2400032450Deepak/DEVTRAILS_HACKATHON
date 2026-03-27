package com.devtrails.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int premium;
    private int coverage;

    public Plan() {}

    public Plan(String name, int premium, int coverage) {
        this.name = name;
        this.premium = premium;
        this.coverage = coverage;
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public int getPremium() { return premium; }
    public int getCoverage() { return coverage; }
}