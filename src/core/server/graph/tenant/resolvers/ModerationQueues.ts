import { CommentConnectionInput } from "talk-server/models/comment";
import { FilterQuery } from "talk-server/models/query";
import { CommentModerationQueueCounts } from "talk-server/models/story";
import {
  PENDING_STATUS,
  REPORTED_STATUS,
  UNMODERATED_STATUSES,
} from "talk-server/services/comments/moderation/counts";
import { GQLModerationQueuesTypeResolver } from "../schema/__generated__/types";
import { ModerationQueueInput } from "./ModerationQueue";

export interface ModerationQueuesInput {
  connection: Partial<CommentConnectionInput>;
  counts: CommentModerationQueueCounts;
}

const mergeModerationInputFilters = (
  filter: FilterQuery<Comment>,
  selector: keyof CommentModerationQueueCounts["queues"]
) => (input: ModerationQueuesInput): ModerationQueueInput => ({
  connection: {
    ...input.connection,
    filter: {
      ...input.connection.filter,
      ...filter,
    },
  },
  count: input.counts.queues[selector],
});

export const ModerationQueues: GQLModerationQueuesTypeResolver<
  ModerationQueuesInput
> = {
  unmoderated: mergeModerationInputFilters(
    {
      status: { $in: UNMODERATED_STATUSES },
    },
    "unmoderated"
  ),
  reported: mergeModerationInputFilters(
    {
      status: { $in: REPORTED_STATUS },
      "actionCounts.FLAG": { $gt: 0 },
    },
    "reported"
  ),
  pending: mergeModerationInputFilters(
    {
      status: { $in: PENDING_STATUS },
    },
    "pending"
  ),
};