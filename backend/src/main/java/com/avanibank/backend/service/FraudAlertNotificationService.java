package com.avanibank.backend.service;

import com.avanibank.backend.dto.FraudAlertNotification;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class FraudAlertNotificationService {

    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>>
            emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String customerEmail) {

        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters
                .computeIfAbsent(
                        customerEmail,
                        key -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitter.onCompletion(() ->
                removeEmitter(customerEmail, emitter));

        emitter.onTimeout(() ->
                removeEmitter(customerEmail, emitter));

        emitter.onError(error ->
                removeEmitter(customerEmail, emitter));

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("CONNECTED")
                            .data("Fraud alert stream connected"));
        } catch (Exception e) {
            removeEmitter(customerEmail, emitter);
        }

        return emitter;
    }

    public void sendFraudAlert(
            String customerEmail,
            FraudAlertNotification notification) {

        List<SseEmitter> customerEmitters =
                emitters.get(customerEmail);

        if (customerEmitters == null
                || customerEmitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : customerEmitters) {

            try {

                emitter.send(
                        SseEmitter.event()
                                .name("FRAUD_ALERT")
                                .data(notification));

            } catch (Exception e) {

                removeEmitter(customerEmail, emitter);
            }
        }
    }

    private void removeEmitter(
            String customerEmail,
            SseEmitter emitter) {

        CopyOnWriteArrayList<SseEmitter> customerEmitters =
                emitters.get(customerEmail);

        if (customerEmitters != null) {

            customerEmitters.remove(emitter);

            if (customerEmitters.isEmpty()) {
                emitters.remove(customerEmail);
            }
        }
    }
}