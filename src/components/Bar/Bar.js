import React from 'react';
import './Bar.scss';

function Bar(props) {

    const getProgress = () => {
        if(props.progress < 25){
            return 'progress-bar five';
        }
        if(props.progress > 25 && props.progress <= 50){
            return 'progress-bar twenty-five';
        }
        if(props.progress > 50 && props.progress <= 75){
            return 'progress-bar fifty';
        }
        if(props.progress > 75 && props.progress < 100){
            return 'progress-bar seventy-five';
        }
        if(props.progress == 100){
            return 'progress-bar hundred';
        }
    }

    const getContainer = () => {
        if(props.spacing){
            return "progress-container spacing";
        }else{
            return "progress-container";
        }
    }

    return(
        <div className={getContainer()}>
            <div className="progress">
                <div className={getProgress()}></div>
            </div>
        </div>
    )
}

export default Bar;
