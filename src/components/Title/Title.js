import React from 'react';
import './Title.scss';

function Title(props) {

    const buildTitle = () => {
        if(props.name){
            switch (props.type) {
                case "large":
                    return <h1>{props.name}</h1>
                    break;
    
                case "medium":
                    return <h3>{props.name}</h3>
                    break;
    
                case "small":
                    return <h5>{props.name}</h5>
                    break;
            
                default:
                    return <p><strong>{props.name}</strong></p>
                    break;
            }
        }else{
            return '';
        }
    }

    return(
        buildTitle()
    )
}

export default Title;