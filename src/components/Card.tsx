export interface Card {
    isFaceUp: boolean;
    emoji: string;
    id: number;
    isRemoved: boolean;
}

export interface CardProps {
    handleClickCard: (c: Card) => void;
    card: Card;
}
export function CardView(props: CardProps) {
    return (
        <div
            onClick={(event) => {
                event.stopPropagation();
                props.handleClickCard(props.card);
            }}
            className={
                'card ' +
                (props.card.isFaceUp ? 'face-up' : '') +
                ' ' +
                (props.card.isRemoved ? 'removed' : '')
            }
        >
            {!props.card.isRemoved && props.card.isFaceUp && props.card.emoji}
            {/* {!props.card.isRemoved && props.card.emoji} */}
        </div>
    );
}
