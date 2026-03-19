import { IERC1155 } from './erc1155.interface';
import { IERC20 } from './erc20.interface';
import { IERC721 } from './erc721.interface';

export type IERC = IERC20 | IERC721 | IERC1155;
