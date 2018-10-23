import {AppServices} from "./services/AppServices";
import {NotificationService} from "./services/notification/NotificationService";

let notificationService = new NotificationService();
//启动通知程序
notificationService.start();
//启动投注程序
AppServices.start();