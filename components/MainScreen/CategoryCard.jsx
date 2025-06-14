import * as React from 'react';
import Text from '../Text';
import theme from '../../utils/Theme'
import Button from '../Button';
import {ImageBackground} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

export default function CategoryCard(props) {
    const {name, image, onPress} = props;
    return (
        <Button onPress={onPress}>
            <ImageBackground
                source={{uri: image}}
                imageStyle={{
                    borderRadius: theme.radii.input,
                }}
                style={{
                    resizeMode: 'cover',
                    height: 140,
                    width: 110,
                    marginRight: 10,
                    overflow: 'hidden',
                }}>
                <LinearGradient
                    colors={['transparent', 'gray']}
                    style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        paddingLeft: 10,
                        paddingBottom: 10,
                    }}>
                    <Text color={'white'} fontWeight={'bold'} fontSize={13}>
                        {name}
                    </Text>
                </LinearGradient>
            </ImageBackground>
        </Button>
    );
}
