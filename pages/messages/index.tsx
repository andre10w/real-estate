import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../src/store";
import {fetchMessages} from "../../src/slices/messages";
import MessageBox from "../../src/components/messages/MessageBox";
import {fetchChats} from "../../src/slices/chats";
import LoadingSpinner from "../../src/components/stuff/LoadingSpinner";

const MessagesPage: React.FC = () => {
    const chatsReducer = useAppSelector((state) => state.chatsReducer);
    const chats = useAppSelector((state) => state.chatsReducer.chats);
    const messagesReducer = useAppSelector((state) => state.messageReducer);
    const messages = useAppSelector((state) => state.messageReducer.messages);
    const dispatch = useAppDispatch();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        dispatch(fetchChats());
        dispatch(fetchMessages());
    }, [dispatch]);

    if (!loaded && chatsReducer.status === "succeeded" && messagesReducer.status === "succeeded") {
        setLoaded(true);
    }

    return <div style={{ height: "calc(100% - 100px)" }}>
        {loaded ?
            // @ts-ignore
            <MessageBox messages={messages} chats={chats} />
            :
            <LoadingSpinner />
        }
    </div>
}

export default MessagesPage;