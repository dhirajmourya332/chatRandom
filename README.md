# ChatRandom
## Introduction:
The Chatrandom application is a full stack MERN web application that allows visitors to engage in random video chats with other users. This unique socializing platform leverages advanced technologies like WebRTC, WebSocket, and ZeroMQ to provide a scalable and robust user experience.

## Technologies Used:
- Redis: An in-memory data store used for caching and efficient data storage.
- Express.js: A web application framework for building the back-end server.
- React.js: A JavaScript library for building user interfaces.
- Node.js: A JavaScript runtime environment for executing server-side code.
- WebRTC: Enables real-time peer-to-peer video communication between web browsers.
- WebSocket: A communication protocol for real-time, bidirectional data exchange.
- ZeroMQ: A high-performance messaging library for building distributed applications.

Features
1. Random Video Chats: Users are paired with random visitors for real-time video conversations.
2. User-Friendly Interface: A clean and intuitive interface for seamless user interaction.
3. Scalability: The application is designed to handle a large number of concurrent users.
4. Robustness: Utilizes advanced technologies to ensure stability and reliability.
5. Secure Communication: Implements encryption and data protection measures for user privacy.

Architecture
The Chatrandom application follows a MERN stack architecture:
- Front-End: Built using React.js, responsible for rendering the user interface and handling user interactions and Tailwindcss for styling.
- Back-End: Developed with Express.js and Node.js, handles pairing algorithms, and acts as a signaling server.
- Redis: Stores visitor websocket-id and the ZMQ port of server instance port to which visitor is connected.
- Real-Time Communication: WebRTC enables direct peer-to-peer video communication between users.
- WebSocket: Facilitates real-time messaging and signaling between clients and the server.
- ZeroMQ: Provides pub-sub(Publisher-Subscriber) pattern for distributed and scalable communication between nodejs server instances.
