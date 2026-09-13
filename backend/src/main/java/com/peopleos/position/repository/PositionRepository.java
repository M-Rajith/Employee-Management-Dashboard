package com.peopleos.position.repository;

import com.peopleos.position.entity.Position;
import com.peopleos.position.entity.PositionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PositionRepository extends JpaRepository<Position, Long> {

    long countByStatus(PositionStatus status);
}
