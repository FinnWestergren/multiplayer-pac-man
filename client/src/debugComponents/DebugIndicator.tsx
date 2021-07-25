import styled from "@emotion/styled";
import React, { FunctionComponent } from "react";

type Props = {
    label: string;
    value?: number | string;
};

const StyledKey = styled.div`
    height: min-content;
    grid-column-start: 1;
    grid-column-end: 2;
` 

const StyledVal = styled.div`
    height: min-content;
    grid-column-start: 2;
    grid-column-end: 3;
` 

const DebugIndicator: FunctionComponent<Props> = ({ label, value }) => {
    return (<>
        <StyledKey>{label}</StyledKey>
        <StyledVal>{value}</StyledVal>
    </>)
}

export default DebugIndicator;
