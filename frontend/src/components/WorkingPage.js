import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './WorkingPage.css';

const Card = ({ title, description, direction }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.5 });

    const cardVariants = {
        hidden: { 
            x: direction === "left" ? -50 : 50, 
            opacity: 0 
        },
        visible: { 
            x: 0, 
            opacity: 1, 
            transition: { 
                type: "spring", 
                stiffness: 100, 
                damping: 12, 
                duration: 0.3 
            } 
        }
    };

    return (
        <motion.div
            ref={ref}
            className={`card ${direction}`}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
        >
            <h3>{title}</h3>
            <p>{description}</p>
        </motion.div>
    );
};

const WorkingTab = () => {
    const cards = [
        {
            title: "1. Logging is a must",
            description: "Without logging in you will sadly not be able to avail the aid of our demand forecasting Models ",
            direction: "left"
        },
        {
            title: "2. Upload the data in a csv file",
            description: "We understand that your sales data should be in an orderly manner and so we ask for the same for better and more accurate forecasting.",
            direction: "right"
        },
        {
            title: "3. Univariate",
            description: "In this method of forecasting we take your files that contain Date and Sales data and give a forecast on the sole basis of your sales.",
            direction: "left"
        },
        {
            title: "4. Multivariate",
            description: "In this method of forecasting we take your files that contain Date and Sales data and give a forecast on the basis of not only your sales but also holidays, seasons, weather (on the basis of your region/locality)etc,. features. ",
            direction: "right"
        },
        {
            title: "5. Extra Features",
            description: "We also provide the facility of downloading our forecast in the form of a csv file for your own analysis and also provide you with a graphical representation of the forecast and also allowing you to store and  view your analysis in a saving page .",
            direction: "left"
        }
    ];

    return (
        <div className="working-tab">
            <div className="card-container">
                {cards.map((card, index) => (
                    <Card key={index} {...card} />
                ))}
            </div>
        </div>
    );
};

export default WorkingTab;