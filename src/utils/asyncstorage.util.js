import { AsyncStorage } from 'react-native';

const AsyncStorageUtil = {
    getItem : (key) => {
        return AsyncStorage.getItem(key);
    },
    storeItem : (key,data) => {
        return AsyncStorage.setItem(key,JSON.stringify(data));
    },
    removeItem : (key) => {
        return AsyncStorage.removeItem(key);
    }
}

export default AsyncStorageUtil;