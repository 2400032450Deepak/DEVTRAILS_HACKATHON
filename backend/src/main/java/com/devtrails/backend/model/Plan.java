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

    // Getters
    public Long getId() { 
        return id; 
    }
    
    public String getName() { 
        return name; 
    }
    
    public int getPremium() { 
        return premium; 
    }
    
    public int getCoverage() { 
        return coverage; 
    }

    // Setters
    public void setId(Long id) { 
        this.id = id; 
    }
    
    public void setName(String name) { 
        this.name = name; 
    }
    
    public void setPremium(int premium) { 
        this.premium = premium; 
    }
    
    public void setCoverage(int coverage) { 
        this.coverage = coverage; 
    }
}