import React, { useEffect, useState } from "react";
import { Modal, ModalProps } from "antd";

import { getRoomList } from "../../../Services";

interface IProps extends ModalProps {}

const Room: React.FC<IRoom> = (props: IRoom) => {
  return (
    <div>
      <div>{props.name}</div>
      <div>房主:{props.ownerId}</div>
      <div>人数:{props.playerList.length}</div>
    </div>
  );
};

const RoomList: React.FC<IProps> = (props: IProps) => {
  const [roomList, setRoomList] = useState<IRoom[]>([]);

  const { afterOpenChange, ...otherProps } = props;

  const handleOpenChange = async (open: boolean) => {
    afterOpenChange?.(open);

    if (open) {
      const { data } = await getRoomList();
      if (data) {
        setRoomList(data);
      }
    }
  };

  return (
    <Modal closable afterOpenChange={handleOpenChange} {...otherProps}>
      {roomList.map((room) => (
        <Room {...room} />
      ))}
    </Modal>
  );
};

export default RoomList;
