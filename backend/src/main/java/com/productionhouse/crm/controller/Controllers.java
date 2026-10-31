package com.productionhouse.crm.controller;

import com.productionhouse.crm.model.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** All 9 REST endpoints. Each one only declares its URL and entity. */
public class Controllers {

    // ----- Task 3: Scheduling & Team Operations -----
    @RestController @RequestMapping("/api/schedules")
    public static class ScheduleController extends CrudController<Schedule> {
        public ScheduleController() { super(Schedule.class); }
    }

    @RestController @RequestMapping("/api/tasks")
    public static class TaskController extends CrudController<Task> {
        public TaskController() { super(Task.class); }
    }

    @RestController @RequestMapping("/api/attendance")
    public static class AttendanceController extends CrudController<Attendance> {
        public AttendanceController() { super(Attendance.class); }
    }

    @RestController @RequestMapping("/api/call-sheets")
    public static class CallSheetController extends CrudController<CallSheet> {
        public CallSheetController() { super(CallSheet.class); }
    }

    @RestController @RequestMapping("/api/locations")
    public static class LocationController extends CrudController<Location> {
        public LocationController() { super(Location.class); }
    }

    // ----- Task 6: Delivery, Analytics & OTT Publishing -----
    @RestController @RequestMapping("/api/deliveries")
    public static class DeliveryController extends CrudController<Delivery> {
        public DeliveryController() { super(Delivery.class); }
    }

    @RestController @RequestMapping("/api/approvals")
    public static class ApprovalController extends CrudController<Approval> {
        public ApprovalController() { super(Approval.class); }
    }

    @RestController @RequestMapping("/api/notifications")
    public static class NotificationController extends CrudController<Notification> {
        public NotificationController() { super(Notification.class); }
    }

    @RestController @RequestMapping("/api/ott-publishing")
    public static class OttPublishingController extends CrudController<OttPublishing> {
        public OttPublishingController() { super(OttPublishing.class); }
    }
}
