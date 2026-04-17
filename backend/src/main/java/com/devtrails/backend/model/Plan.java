package com.devtrails.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int coverage;  // Only coverage, NO premium!

    public Plan() {}

    public Plan(String name, int coverage) {
        this.name = name;
        this.coverage = coverage;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public int getCoverage() { return coverage; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setCoverage(int coverage) { this.coverage = coverage; }
}