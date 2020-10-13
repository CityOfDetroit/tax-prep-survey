import React, { useState }from 'react';
import './Card.scss';
import Title from '../Title/Title';
import Body from '../Body/Body';

function Card(props) {

    const buildCard = () => {
        let cardType = "Card";
        if (props.type){
            cardType += ` ${props.type}`;
            return (
                <article className={cardType}>
                    <Title type={props.titleType} name={props.title}></Title>
                    <Body type={props.bodyType} content={props.body}></Body>
                </article>
            )
        }else{
            return (
                <article className="Card default">
                    <Title name={props.title}></Title>
                    <Body type={props.bodyType} content={props.body}></Body>
                </article>
            )
        }
    }

    return(
        buildCard()
    )
}

export default Card;
