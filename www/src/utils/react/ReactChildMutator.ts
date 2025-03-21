import React from "react";

class ReactChildMutator {
    private toClone: React.ReactElement<any, any>;
    private toMutate!: React.ReactElement<any, any>;

    private mutatedChild: React.ReactElement<any, any>;

    private ref: ((element: HTMLElement) => void) | undefined;
    private listeners: { key: string; handler: React.EventHandler<any> }[] = [];

    public constructor(
        toClone: React.ReactElement<any, any>,
        toMutate?: React.ReactElement<any, any>
    ) {
        this.toClone = toClone;
        if (!toMutate) this.toMutate = this.toClone;

        this.mutatedChild = toClone;
    }

    public get() {
        return React.cloneElement(this.toClone, { ...this.listeners, ref: this.ref });
    }

    public appendRef = (ref: React.RefObject<unknown>) => {
        const image = this.mutatedChild.props.ref;

        this.ref = (element) => {
            if (!element) return;
            if (image) {
                switch (typeof image) {
                    case "function":
                        image(element);
                    /** ROOT REF */
                    case "object":
                        this.toMutate.props.ref.current = element;
                }
            }

            ref.current = element;
        };

        // this.mutatedChild = React.cloneElement(this.mutatedChild, {
        //     ref: (htmlElement: HTMLElement) => {
        //         if (!htmlElement) return;
        //         if (image) {
        //             if (typeof image === "function") {
        //                 image(htmlElement);
        //             } else {
        //                 this.child.props.ref.current = htmlElement;
        //             }
        //         }
        //         ref.current = htmlElement;
        //     },
        // });

        return this;
    };

    public appendListener = (key: string, listener: React.EventHandler<any>) => {
        this.listeners.push({
            key,
            handler: (event: any) => {
                if (typeof this.toMutate.props[key] === "function") {
                    this.toMutate.props[key](event);
                }

                listener(event);
            },
        });

        // this.mutatedChild = React.cloneElement(this.mutatedChild, {
        //     [key]: (event: any) => {
        //         if (typeof this.child.props[key] === "function") {
        //             this.child.props[key](event);
        //         }

        //         listener(event);
        //     },
        // });

        return this;
    };
}

export default ReactChildMutator;
