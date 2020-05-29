import { useEffect, useState } from "react";
import { css, StyleSheet } from "aphrodite";
import PropTypes from "prop-types";

import colors from "~/config/themes/colors";
import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";
import ReactPlaceholder from "react-placeholder/lib";
import LeaderboardPlaceholder from "../Placeholders/LeaderboardPlaceholder";
import LeaderboardUser from "./LeaderboardUser";
import Link from "next/link";

const LeaderboardContainer = (props) => {
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  // componentDidMount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = () => {
    setFetchingUsers(true);
    return fetch(
      API.LEADERBOARD({ limit: 10, page: 1, hubId: props.hubId }),
      API.GET_CONFIG()
    )
      .then(Helpers.checkStatus)
      .then(Helpers.parseJSON)
      .then((res) => {
        setFetchingUsers(false);
        setUsers(res.results);
      });
  };

  const renderLeaderboardUsers = (users) => {
    return users.map((user, index) => {
      return (
        <div className={css(styles.user)} key={`user_${index}_${user.id}`}>
          <LeaderboardUser
            user={user}
            name={
              user.author_profile.first_name +
              " " +
              user.author_profile.last_name
            }
            authorProfile={user.author_profile}
            reputation={user.reputation}
            authorId={user.author_profile.id}
          />
        </div>
      );
    });
  };

  return (
    <div className={css(styles.container)}>
      <h3 className={css(styles.reputable)}>Most Reputable Users</h3>
      <ReactPlaceholder
        ready={!fetchingUsers}
        customPlaceholder={<LeaderboardPlaceholder color="#efefef" />}
      >
        {renderLeaderboardUsers(users)}
        <div className={css(styles.linkContainer)}>
          <Link href={"/leaderboard/[type]"} as={"/leaderboard/users"}>
            <a className={css(styles.link)}>View Leaderboard</a>
          </Link>
        </div>
      </ReactPlaceholder>
    </div>
  );
};

LeaderboardContainer.propTypes = {
  hubId: PropTypes.number,
};

const styles = StyleSheet.create({
  container: {
    border: "1px solid #eee",
    background: "#fff",
    padding: 16,
    borderRadius: 4,
  },
  reputable: {
    borderBottom: "1px solid #eee",
    marginTop: 0,
    fontWeight: 400,
    paddingBottom: 8,
    textAlign: "center",
  },
  user: {
    marginBottom: 16,
  },
  link: {
    textDecoration: "none",
    color: "rgba(78, 83, 255)",
    fontWeight: 300,
    textTransform: "capitalize",
    fontSize: 16,
    padding: "3px 5px",
    ":hover": {
      color: "rgba(78, 83, 255, .5)",
      textDecoration: "underline",
    },
  },
  linkContainer: {
    marginTop: 16,
    textAlign: "center",
  },
});

export default LeaderboardContainer;