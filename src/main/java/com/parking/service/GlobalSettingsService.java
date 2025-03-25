package com.parking.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.parking.model.GlobalSettings;
import com.parking.repository.GlobalSettingsRepository;

@Service
public class GlobalSettingsService {

    @Autowired
    private GlobalSettingsRepository globalSettingsRepository;
    
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * Get the global settings. If none exist, create default settings.
     */
    public GlobalSettings getGlobalSettings() {
        GlobalSettings settings = globalSettingsRepository.findFirstBy();
        
        if (settings == null) {
            // Create default settings if none exist
            settings = new GlobalSettings();
            settings.setUpdatedAt(LocalDateTime.now().format(formatter));
            settings = globalSettingsRepository.save(settings);
        }
        
        return settings;
    }
    
    /**
     * Update the global settings
     */
    public GlobalSettings updateGlobalSettings(GlobalSettings settingsDetails) {
        GlobalSettings settings = getGlobalSettings(); // Get existing or create new
        
        settings.setDefaultPenaltyAmount(settingsDetails.getDefaultPenaltyAmount());
        settings.setDefaultHourlyRate(settingsDetails.getDefaultHourlyRate());
        settings.setUpdatedAt(LocalDateTime.now().format(formatter));
        
        return globalSettingsRepository.save(settings);
    }
}