import React, { useState, useEffect } from 'react';
import { Form, Input, Button, List, notification } from 'antd';
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import style from './style.module.css';

interface TextItem {
  id: string;
  text: string;
  uid: string; 
}

const Institutions: React.FC = () => {
  const [form] = Form.useForm();
  const [texts, setTexts] = useState<TextItem[]>([]);
  const auth = getAuth();
  const db = getFirestore();

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'texts'), where('uid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: TextItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, text: doc.data().text, uid: doc.data().uid });
        });
        setTexts(items);
      });

      return () => unsubscribe();
    }
  }, [db, user]);

  const handleAddText = async (values: { text: string }) => {
    try {
      if (user) {
        await addDoc(collection(db, 'texts'), {
          text: values.text,
          uid: user.uid,
        });
        notification.success({
          message: 'Text Added',
          description: 'Your text has been added successfully.',
        });
        form.resetFields();
      }
    } catch (error: any) {
      notification.error({
        message: 'Error Adding Text',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const item = texts.find((text) => text.id === id);
      if (item && user && item.uid === user.uid) { // Check if the user owns the text
        await deleteDoc(doc(db, 'texts', id));
        notification.success({
          message: 'Text Deleted',
          description: 'Your text has been deleted successfully.',
        });
      } else {
        notification.error({
          message: 'Error Deleting Text',
          description: 'You are not authorized to delete this text.',
        });
      }
    } catch (error: any) {
      notification.error({
        message: 'Error Deleting Text',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleEdit = async (item: TextItem) => {
    try {
      if (user && item.uid === user.uid) { // Check if the user owns the text
        const newText = prompt('Edit your text:', item.text);
        if (newText) {
          await updateDoc(doc(db, 'texts', item.id), {
            text: newText,
          });
          notification.success({
            message: 'Text Updated',
            description: 'Your text has been updated successfully.',
          });
        }
      } else {
        notification.error({
          message: 'Error Updating Text',
          description: 'You are not authorized to update this text.',
        });
      }
    } catch (error: any) {
      notification.error({
        message: 'Error Updating Text',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className={style.main}>
      <Form form={form} onFinish={handleAddText}>
        <Form.Item
          name="text"
          rules={[{ required: true, message: 'Please enter some text' }]}>
          <Input placeholder="Enter text here" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Text
          </Button>
        </Form.Item>
      </Form>
      <List
        itemLayout="horizontal"
        dataSource={texts}
        renderItem={(text) => (
          <List.Item
            key={text.id}
            actions={
              user && text.uid === user.uid
                ? [
                    <Button type="link" onClick={() => handleEdit(text)} key={`edit-${text.id}`}>
                      Edit
                    </Button>,
                    <Button type="link" danger onClick={() => handleDelete(text.id)} key={`delete-${text.id}`}>
                      Delete
                    </Button>,
                  ]
                : []
            }
          >
            <List.Item.Meta title={text.text} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Institutions;
