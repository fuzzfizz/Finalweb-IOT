import { NextApiRequest, NextApiResponse } from 'next';

interface SensorData {
    LDR: number;
    VR: number;
    TEMP: number;
    DISTANCE: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { LDR, VR, TEMP, DISTANCE }: SensorData = req.body;

        // คุณสามารถเก็บข้อมูลนี้ไว้ในฐานข้อมูลหรือตัวแปรในโปรเจกต์
        const data: SensorData = { LDR, VR, TEMP, DISTANCE };

        // Response กลับไปยัง Microcontroller ว่ารับข้อมูลสำเร็จ
        res.status(201).json({ message: 'Data received successfully', data });
    } else {
        res.status(405).json({ message: 'Only POST requests are allowed' });
    }
}