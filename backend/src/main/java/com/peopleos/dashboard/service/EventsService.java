package com.peopleos.dashboard.service;

import com.peopleos.dashboard.dto.EventResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

/**
 * Upcoming holidays & company events, derived from today's date.
 * Variable-date festivals use representative fixed dates that recur yearly.
 */
@Service
public class EventsService {

    private record Festivity(String name, int month, int day) {
    }

    private static final List<Festivity> FESTIVITIES = List.of(
            new Festivity("New Year's Day", 1, 1),
            new Festivity("Pongal", 1, 14),
            new Festivity("Republic Day", 1, 26),
            new Festivity("Holi", 3, 4),
            new Festivity("Eid al-Fitr", 3, 21),
            new Festivity("May Day", 5, 1),
            new Festivity("Raksha Bandhan", 8, 9),
            new Festivity("Independence Day", 8, 15),
            new Festivity("Vinayaka Chaturthi", 8, 27),
            new Festivity("Gandhi Jayanti", 10, 2),
            new Festivity("Dussehra", 10, 20),
            new Festivity("Diwali", 11, 8),
            new Festivity("Company Annual Day", 12, 20),
            new Festivity("Christmas", 12, 25)
    );

    private static final DateTimeFormatter LABEL = DateTimeFormatter.ofPattern("EEE, d MMM");

    public List<EventResponse> upcoming(int limit) {
        LocalDate today = LocalDate.now();
        return FESTIVITIES.stream()
                .map(f -> {
                    LocalDate date = LocalDate.of(today.getYear(), f.month(), f.day());
                    if (date.isBefore(today)) {
                        date = date.plusYears(1);
                    }
                    return new EventResponse(f.name(), date, date.format(LABEL),
                            ChronoUnit.DAYS.between(today, date));
                })
                .sorted(Comparator.comparing(EventResponse::date))
                .limit(limit)
                .toList();
    }
}
