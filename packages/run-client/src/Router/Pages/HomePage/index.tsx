import React, { useLayoutEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../../Services";
import RoomList from "./RoomList";
import { tryGetUser, createUser } from "@utils";
import { Modal } from "antd-mobile";
import { DiceBtn2, Button } from "@components";
import { randomInt, getMapColor } from "@utils";
import { DEFAULT_HOUSE_COLOR } from "@constant";
import classNames from "classnames";

import styles from "./index.module.less";
import horseBodyImg from "@assets/Image/horse-body.png";
import horseHeadImg from "@assets/Image/horse-head2.png";
import { HorseHeadMask, HorseBodyMask } from "@assets/Jsx";
import titleIcon from "@assets/Icon/title.png";

interface IProps {}

const HomePage: React.FC<IProps> = () => {
  const [roomListVisible, setRoomListVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputNameRef = useRef<string>("");
  const [dice, setDice] = useState<{
    value?: number;
    color?: string;
  }>({});

  const navigate = useNavigate();

  const changeColor = () => {
    setTimeout(() => {
      setDice({
        value: randomInt(1, 4),
        color: getMapColor(DEFAULT_HOUSE_COLOR[randomInt(0, 5)]),
      });
    }, 1000);
    setTimeout(() => {
      setDice({});
    }, 3500);
  };

  useLayoutEffect(() => {
    changeColor();
    const timer = setInterval(() => {
      changeColor();
    }, 4000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const initUser = async () => {
    let user = tryGetUser();
    if (!user) {
      user = await new Promise((resolve, reject) => {
        Modal.show({
          getContainer: () => rootRef.current as HTMLDivElement,
          closeOnMaskClick: true,
          content: (
            <div className={styles["name-modal"]}>
              <input
                className={styles["name-input"]}
                placeholder="请随意输入一个昵称"
                onChange={(e) => (inputNameRef.current = e.target.value)}
              ></input>
              <Button
                size="small"
                className={styles["name-btn"]}
                style={{ width: 80 }}
                onClick={() => {
                  if (!inputNameRef.current) {
                    return reject(new Error("用户名不能为空"));
                  }
                  const user = createUser(inputNameRef.current);
                  resolve(user);
                }}
              >
                确认
              </Button>
            </div>
          ),
        });
      });
    }

    return user;
  };

  const handleCreateRoom = async () => {
    const user = await initUser();
    const res = await createRoom({
      userId: user.userId,
      userName: user.userName,
    });

    const roomId = res?.data?.id;
    if (roomId) {
      navigate(`room/${roomId}`);
    }
  };

  const handleJoinRoom = async () => {
    await initUser();
    navigate(`room-list`);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      {/* <div className={styles["title"]}>
        Horse Racing
      </div> */}
      <div className={styles["title"]}>
        <img src={titleIcon} alt="" />
      </div>
      <div className={styles["btn-group"]}>
        <Button className={styles["btn"]} type="text" onClick={handleJoinRoom}>
          加入房间
        </Button>
        <Button className={styles["btn"]} onClick={handleCreateRoom}>
          创建房间
        </Button>
      </div>

      <RoomList
        open={roomListVisible}
        closable
        onCancel={() => setRoomListVisible(false)}
      ></RoomList>
      <img className={styles["horse-image"]} src={horseBodyImg} alt="" />
      <img
        className={classNames(styles["horse-image"], styles["horse-head"])}
        src={horseHeadImg}
        alt=""
      />
      <div
        className={classNames(
          styles["horse-image"],
          styles["horse-image-mask"]
        )}
      >
        <HorseBodyMask color={dice.color} />
      </div>
      <div
        className={classNames(
          styles["horse-image"],
          styles["horse-image-mask"],
          styles["horse-head"]
        )}
      >
        <HorseHeadMask color={dice.color} />
      </div>
      <DiceBtn2
        className={styles["dice-btn"]}
        value={dice.value}
        color={dice.color}
        onlyFace={true}
      />
    </div>
  );
};

export default HomePage;
