package com.peopleos.activity.service;

import com.peopleos.activity.dto.ActivityResponse;
import com.peopleos.activity.repository.ActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> recent() {
        return activityRepository.findTop15ByOrderByCreatedAtDesc()
                .stream().map(ActivityResponse::from).toList();
    }
}
