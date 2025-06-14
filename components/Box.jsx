import styled from 'styled-components/native';
import { View } from "react-native";
import {compose, flexbox, border, color, size, borderRadius, space} from 'styled-system';

export const Box = styled(View)(
   compose(flexbox, space, border, color, size, borderRadius),
);