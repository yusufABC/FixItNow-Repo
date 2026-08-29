import cookieParser from "cookie-parser";
import express, { Request, Response, type Application } from "express"
import config from "./config";
import cors from "cors"
import { authRouter } from "./modules/auth/auth.route";
import { userRouter } from "./modules/user/user.route";
import { serviceRouter } from "./modules/service/service.route";
import { bookingRouter } from "./modules/booking/booking.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { reviewRoutes } from "./modules/review/review.route";
import { adminRoutes } from "./modules/admin/admin.route";
const app:Application=express()
app.use("/api/payments/webhook",express.raw({type: 'application/json'}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use('/api/users',userRouter)
app.use('/api/auth',authRouter)
app.use("/api/services", serviceRouter);
app.use("/api/bookings",bookingRouter );
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
export default app