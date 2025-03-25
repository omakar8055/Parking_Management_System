package com.parking.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.parking.model.GlobalSettings;

public interface GlobalSettingsRepository extends MongoRepository<GlobalSettings, String> {
    // Find the first global settings document (there should only be one)
    GlobalSettings findFirstBy();
}