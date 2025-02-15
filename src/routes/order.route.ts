import { Router } from "express";
import asyncHandler from 'express-async-handler';
import { HTTP_BAD_REQUEST } from "../constants/htttp_status";
import { OrderStatus } from "../constants/order_status";
import { OrderModel } from "../models/Order.model";

const router =  Router();

router.post('/create', asyncHandler(
    async (req:any, res:any) => {
        const requestOrder = req.body;
        const userId = req.user.id;
        if(requestOrder.items.length <= 0) {
            res.status(HTTP_BAD_REQUEST).send("Cart is Empty");
            return;
        }

        await OrderModel.deleteOne({
            user: userId,
            status: OrderStatus.NEW
        })

        const order = new OrderModel({...requestOrder, user: userId});
        await order.save()
        res.send(order);
    }))

router.get('/getOrder/:id',asyncHandler(
    async (req:any, res:any) =>{
        const id = req.params.id;
        const order = await getNewOrder(id)
        
        res.send(order);

    }))

router.get('/getPayedOrder/:id',asyncHandler(
        async (req:any, res:any) =>{
            const id = req.params.id;
            const order = await OrderModel.findOne({ paymentId: id, status: OrderStatus.PAYED});
            
            res.send(order);
    
        }))

router.post('/pay', asyncHandler(
    async (req:any, res:any) => {
        const id = req.user.id;
        const {paymentId}= req.body;
        const order = await getNewOrder(id)

        if(!order){
            res.status(HTTP_BAD_REQUEST).send('Order Not Found!');
            return;
        }
    
        order.paymentId = paymentId;
        order.status = OrderStatus.PAYED;
        await order.save();
    
        res.send(order._id);

    }))

router.get('/track/:id', asyncHandler( async (req, res) => {
        const order = await OrderModel.findById(req.params.id);
        res.send(order);
}))

async function getNewOrder(id: any) {
    return await OrderModel.findOne({ user: id, status: OrderStatus.NEW });
}

export default router;
