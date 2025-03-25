package com.parking.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "global_settings")
public class GlobalSettings {
    @Id
    private String id;
    private double defaultPenaltyAmount = 50.0; // Default penalty amount
    private double defaultHourlyRate = 10.0;    // Default hourly rate for new slots
    private String updatedAt;
}