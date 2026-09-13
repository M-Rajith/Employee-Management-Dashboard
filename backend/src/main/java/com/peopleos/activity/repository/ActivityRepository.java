package com.peopleos.activity.repository;

import com.peopleos.activity.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findTop15ByOrderByCreatedAtDesc();

    List<Activity> findTop6ByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}
