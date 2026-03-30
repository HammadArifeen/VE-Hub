import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import mentorsRouter from "./mentors";
import sessionsRouter from "./sessions";
import notesRouter from "./notes";
import resourcesRouter from "./resources";
import notificationsRouter from "./notifications";
import messagesRouter from "./messages";
import mockResultsRouter from "./mock-results";
import homeworkRouter from "./homework";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(mentorsRouter);
router.use(sessionsRouter);
router.use(notesRouter);
router.use(resourcesRouter);
router.use(notificationsRouter);
router.use(messagesRouter);
router.use(mockResultsRouter);
router.use(homeworkRouter);

export default router;
