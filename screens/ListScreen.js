import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Button } from 'react-native-elements';
import { Header } from 'react-native-elements';
import { Input } from 'react-native-elements';
import { ListItem } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';


const db = SQLite.openDatabase('wishdb.db');

export default function App() {
  const[product, setProduct] = useState('');
  const[amount, setAmount] = useState('');
  const[data, setData] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists wishlist (id integer primary key not null, product text, amount text);');
    });
    updateWishList();
  }, []);

  const saveProduct = () => {
    db.transaction(tx => {
        tx.executeSql('insert into wishlist (product, amount) values (?, ?);', [product, amount]);    
      }, null, updateWishList
    )
  }

  const updateWishList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from wishlist;', [], (_, { rows }) =>
        setData(rows._array)
      ); 
    });
    setProduct('');
    setAmount('');
  }

  const deleteProduct = (id) => {
    db.transaction(
      tx => {
        tx.executeSql(`delete from wishlist where id = ?;`, [id]);
      }, null, updateWishList
    )    
  }

  return (
    <View>
      <Header
        placement="center"
        centerComponent={{ text: 'WISHLIST: Future posts', style: { color: '#fff' } }}
      />
      <Input
        label='Item'
        placeholder='Item'
        value={product}
        onChangeText={product => setProduct(product)}
      />
      <Input
        label='Amount'
        placeholder='Amount'
        value={amount}
        onChangeText={amount => setAmount(amount)}
      />

      <View>
        <Button buttonStyle='color: gray' onPress={saveProduct} title="SAVE" />
      </View>
      <View>
        {
          data.map((item, i) => (
            <ListItem
              key={i}
              title={item.product}
              subtitle={item.amount}
              rightTitle='(hold to delete)'
              onLongPress={() => deleteProduct(item.id)}
              bottomDivider
            />
          ))
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#023028',
    alignItems: 'center',
    justifyContent: 'center'
  },
  grid1: {
    // flex: 1/3,
    flexDirection: 'row',
    backgroundColor: "#E66060",
  },
  grid2:{
    flex: 1/3,
    alignItems: 'center',
    backgroundColor: '#023028',
  },
  listcontainer: {
    flexDirection: 'row',
    backgroundColor: "#E66060",
   },
});