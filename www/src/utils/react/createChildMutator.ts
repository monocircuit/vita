import React from "react";

type store = {
    refs: ((element: any) => void)[];
    handlers: { key: string; handle: (event: any) => void }[];
};

const createChildMutator = (target: React.ReactElement<any, any>) => {
    const store: store = {
        refs: [
            /**
             * First ref in the ref chain, closes the chain to the
             * child that needs to be mutated.
             */
            (element) => {
                if (typeof target.props.ref === "function") {
                    target.props.ref(element);
                } else {
                    target.props.ref.current = element;
                }
            },
        ],
        handlers: [],
    };

    const props: any = {};

    const result = {
        appendRef: (ref: React.RefObject<unknown>) => {
            store.refs.push((element: any) => {
                if (!element) return;
                ref.current = element;
            });

            return result;
        },

        appendHandler: (key: string, handler: React.EventHandler<any>) => {
            store.handlers.push({
                key,
                handle: (event) => {
                    if (typeof target.props[key] === "function") {
                        target.props[key](event);
                    }

                    handler(event);
                },
            });

            return result;
        },

        appendProp: (key: string, value: any) => {
            props[key] = value;
        },

        mutate: (clone: React.ReactElement<any, any> = target) => {
            props.ref = (element: any) => store.refs.forEach((ref) => ref(element));
            store.handlers.forEach((handler) => (props[handler.key] = handler.handle));

            return React.cloneElement(clone, props);
        },
    };

    return result;
};

export default createChildMutator;
